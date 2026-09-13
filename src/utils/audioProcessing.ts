/**
 * Utility functions for real audio extraction and encoding
 */

/**
 * Converts a Web Audio API AudioBuffer to a genuine 16-bit PCM WAV Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  const sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF chunk descriptor
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);  // file length - 8
  setUint32(0x45564157); // "WAVE"

  // "fmt " sub-chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16);         // Subchunk1Size (16 for PCM)
  setUint16(1);          // AudioFormat (1 for PCM)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // ByteRate
  setUint16(numOfChan * 2);              // BlockAlign
  setUint16(16);                         // BitsPerSample

  // "data" sub-chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4); // Subchunk2Size

  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

/**
 * Extracts audio from a video file via the backend FFmpeg engine with fallback to Web Audio API
 */
export async function extractAudioFromVideo(
  file: File,
  format: string,
  bitrate: string,
  onProgress: (progress: number, statusText: string) => void
): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const targetExt = format.toLowerCase().trim();

  return new Promise(async (resolve, reject) => {
    try {
      onProgress(10, 'Uploading video to audio extraction engine...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', targetExt);
      formData.append('bitrate', bitrate.replace('bps', '').trim());

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/extract-audio');
      xhr.responseType = 'blob';

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(80, Math.round((event.loaded / event.total) * 80));
          onProgress(percent, `Uploading video (${percent}%)...`);
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100, 'Audio track isolated successfully!');
          const blob = xhr.response;
          const outputName = `${baseName}_extracted.${targetExt}`;
          resolve({ blob, filename: outputName });
        } else {
          // If server returns error, try client-side Web Audio API fallback for supported video/audio
          console.warn('Backend audio extraction failed, attempting browser Web Audio API decoding fallback...');
          try {
            onProgress(60, 'Attempting client-side audio decoding...');
            const fallbackResult = await extractAudioClientFallback(file, baseName);
            onProgress(100, 'Audio extracted via browser Web Audio decoder!');
            resolve(fallbackResult);
          } catch (clientErr) {
            reject(new Error(`Extraction failed: Server returned HTTP ${xhr.status}. ${clientErr instanceof Error ? clientErr.message : ''}`));
          }
        }
      };

      xhr.onerror = async () => {
        console.warn('Network error reaching backend, trying client-side fallback...');
        try {
          onProgress(60, 'Network unavailable, decoding audio locally...');
          const fallbackResult = await extractAudioClientFallback(file, baseName);
          onProgress(100, 'Audio extracted locally!');
          resolve(fallbackResult);
        } catch (clientErr) {
          reject(new Error('Audio extraction failed. Please ensure the video has an audio stream.'));
        }
      };

      xhr.send(formData);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Converts an audio file from one format to another via backend FFmpeg engine with fallback
 */
export async function convertAudioFile(
  file: File,
  targetFormat: string,
  bitrate: string,
  onProgress: (progress: number, statusText: string) => void
): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const targetExt = targetFormat.toLowerCase().trim();

  return new Promise(async (resolve, reject) => {
    try {
      onProgress(10, 'Uploading audio for transcoding...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', targetExt);
      formData.append('bitrate', bitrate.replace('bps', '').trim());

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/convert-audio');
      xhr.responseType = 'blob';

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(80, Math.round((event.loaded / event.total) * 80));
          onProgress(percent, `Uploading audio (${percent}%)...`);
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100, 'Audio converted successfully!');
          const blob = xhr.response;
          const outputName = `${baseName}.${targetExt}`;
          resolve({ blob, filename: outputName });
        } else {
          // If server returns error, try client-side Web Audio fallback for wav
          if (targetExt === 'wav') {
            try {
              onProgress(60, 'Decoding and encoding to WAV in browser...');
              const fallbackResult = await extractAudioClientFallback(file, baseName);
              onProgress(100, 'Audio converted locally to WAV!');
              resolve({ blob: fallbackResult.blob, filename: `${baseName}.wav` });
              return;
            } catch (e) {}
          }
          reject(new Error(`Conversion failed with HTTP ${xhr.status}.`));
        }
      };

      xhr.onerror = async () => {
        if (targetExt === 'wav') {
          try {
            onProgress(60, 'Decoding locally to WAV...');
            const fallbackResult = await extractAudioClientFallback(file, baseName);
            onProgress(100, 'Audio converted locally to WAV!');
            resolve({ blob: fallbackResult.blob, filename: `${baseName}.wav` });
            return;
          } catch (e) {}
        }
        reject(new Error('Network error converting audio file.'));
      };

      xhr.send(formData);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Client-side fallback using AudioContext to decode audio frames and produce a genuine WAV file
 */
async function extractAudioClientFallback(file: File, baseName: string): Promise<{ blob: Blob; filename: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx();

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const wavBlob = audioBufferToWav(audioBuffer);
    return {
      blob: wavBlob,
      filename: `${baseName}_extracted.wav`
    };
  } finally {
    if (audioCtx.state !== 'closed') {
      await audioCtx.close();
    }
  }
}
