import { File } from 'expo-file-system';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.5:5000';

async function request(endpoint, options = {}) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
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
    if (error.name === 'AbortError') {
      throw new Error(
        'Request timed out. Check that the backend is running and your phone is connected to the same Wi-Fi.'
      );
    }

    console.log(
      `API request error: ${error.message}`
    );

    throw error;
  } finally {
    clearTimeout(timeout);
  }
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

    try {
      /*
       * Convert the local file URI into an Expo File object.
       * This avoids the Unsupported FormDataPart implementation error.
       */
      const videoFile = new File(videoUri);

      console.log(
        'Video file exists:',
        videoFile.exists
      );

      console.log(
        'Video file name:',
        videoFile.name
      );

      const formData = new FormData();

      /*
       * Important:
       * Append the actual File object, not { uri, name, type }.
       */
      formData.append('video', videoFile, safeFileName);

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 120000);

      try {
        console.log(
          'Sending video as multipart FormData...'
        );

        const response = await fetch(
          `${BASE_URL}/predict`,
          {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          }
        );

        const responseText = await response.text();

        console.log(
          `Prediction response: ${response.status}`,
          responseText
        );

        let data;

        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Invalid prediction response: ${responseText}`
          );
        }

        if (!response.ok) {
          throw new Error(
            data.error || 'Prediction failed'
          );
        }

        return data;
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(
          'Prediction timed out. The video may be too large or the backend is processing slowly.'
        );
      }

      console.log(
        'Prediction request error:',
        error.message
      );

      throw error;
    }
  },
};

export function getBaseUrl() {
  return BASE_URL;
}