const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.5:5000';

const REQUEST_TIMEOUT_MS = 60000; // 60s — enough for Render cold starts
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNetworkError(error) {
  const msg = (error?.message || '').toLowerCase();
  return (
    error?.name === 'AbortError' ||
    msg.includes('network request failed') ||
    msg.includes('fetch failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('network error') ||
    msg.includes('aborted') ||
    msg.includes('timeout')
  );
}

async function request(endpoint, options = {}) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      if (attempt > 0) {
        console.log(
          `Retry ${attempt}/${MAX_RETRIES} for ${endpoint} (server may be waking up)...`
        );
        await sleep(RETRY_DELAY_MS);
      }

      console.log(`API request: ${BASE_URL}${endpoint}`);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });

      const responseText = await response.text();

      console.log(
        `API response: ${response.status}`,
        responseText
      );

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Invalid server response: ${responseText}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || `Request failed with status ${response.status}`
        );
      }

      return data;
    } catch (error) {
      lastError = error;

      clearTimeout(timeout);

      // Only retry on network/timeout errors, not on server-side errors
      if (isNetworkError(error) && attempt < MAX_RETRIES) {
        console.log(
          `Network error on attempt ${attempt + 1}: ${error.message}. Retrying...`
        );
        continue;
      }

      if (error.name === 'AbortError') {
        throw new Error(
          'Request timed out. The server may be starting up — please try again in a moment.'
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

export const api = {
  signup: async (email, password) => {
    return request('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
  },

  login: async (email, password) => {
    return request('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
  },

  predict: async (
    videoUri,
    fileName = 'glucose-recording.mp4'
  ) => {
    if (!videoUri) {
      throw new Error('Video URI is missing');
    }

    console.log(
      'Prediction request:',
      `${BASE_URL}/predict`
    );

    console.log(
      'Uploading video URI:',
      videoUri
    );

    const safeFileName = fileName?.endsWith('.mp4')
      ? fileName
      : `${fileName || 'glucose-recording'}.mp4`;

    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(
            `Retry ${attempt}/${MAX_RETRIES} for /predict (server may be waking up)...`
          );
          await sleep(RETRY_DELAY_MS);
        }

        console.log('Sending video via XMLHttpRequest...');

        const data = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${BASE_URL}/predict`);
          xhr.timeout = REQUEST_TIMEOUT_MS;

          xhr.onload = () => {
            console.log(`Prediction response: ${xhr.status}`, xhr.responseText);

            let parsed;
            try {
              parsed = JSON.parse(xhr.responseText);
            } catch {
              reject(new Error(`Invalid prediction response: ${xhr.responseText}`));
              return;
            }

            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.error || 'Prediction failed'));
            }
          };

          xhr.onerror = () => {
            reject(new Error('Network request failed'));
          };

          xhr.ontimeout = () => {
            reject(new Error(
              'Upload timed out. The server may be starting up — please try again in a moment.'
            ));
          };

          const formData = new FormData();
          formData.append('video', {
            uri: videoUri,
            name: safeFileName,
            type: 'video/mp4',
          });

          xhr.send(formData);
        });

        return data;
      } catch (error) {
        lastError = error;

        if (isNetworkError(error) && attempt < MAX_RETRIES) {
          console.log(
            `Upload error on attempt ${attempt + 1}: ${error.message}. Retrying...`
          );
          continue;
        }

        console.log(
          'Prediction request error:',
          error.message
        );

        if (isNetworkError(error)) {
          throw new Error(
            'Could not reach the server. It may still be starting up — please wait a moment and try again.'
          );
        }

        throw error;
      }
    }

    throw lastError;
  },
};

export function getBaseUrl() {
  return BASE_URL;
}