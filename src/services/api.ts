import { SituationAnalysis, ChatMessage } from '../types/analysis';

export interface AnalyzeRequest {
  imageBase64: string;
  mimeType: string;
  userFocus?: string;
}

export class AnalysisService {
  /**
   * Safely parses response from the server, handling JSON or unexpected HTML/text
   */
  private static async parseResponse(response: Response, defaultError: string) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `${defaultError} (${response.status})`);
      }
      return data;
    }

    // Response is not JSON (e.g. HTML or text)
    const rawText = await response.text();
    if (!response.ok) {
      if (rawText.toLowerCase().includes('<!doctype') || rawText.toLowerCase().includes('<html')) {
        throw new Error(`The service is warming up or temporarily unavailable (${response.status}). Please try again in a moment.`);
      }
      throw new Error(`${defaultError} (Status: ${response.status})`);
    }

    // If status was 200 but received HTML instead of JSON
    if (rawText.toLowerCase().includes('<!doctype') || rawText.toLowerCase().includes('<html')) {
      throw new Error('Received unexpected HTML response from server. Please retry the analysis.');
    }

    try {
      return JSON.parse(rawText);
    } catch {
      throw new Error('Invalid response format received from server.');
    }
  }

  /**
   * Sends image to Gemini for situation analysis via server proxy.
   */
  static async analyzeSituation(req: AnalyzeRequest): Promise<SituationAnalysis> {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(req),
    });

    const data = await this.parseResponse(response, 'Failed to analyze situation');
    return data as SituationAnalysis;
  }

  /**
   * Sends follow-up questions about the active image context.
   */
  static async sendFollowUp(
    imageBase64: string,
    mimeType: string,
    history: ChatMessage[],
    message: string
  ): Promise<string> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        imageBase64,
        mimeType,
        history: history.map((h) => ({
          role: h.role,
          text: h.text,
        })),
        message,
      }),
    });

    const data = await this.parseResponse(response, 'Failed to get follow-up answer');
    return data.text || 'Unable to generate follow-up answer.';
  }

  /**
   * Health check to detect whether server and Gemini API key are active.
   */
  static async checkHealth(): Promise<{ status: string; hasApiKey: boolean }> {
    try {
      const res = await fetch('/api/health', { credentials: 'same-origin' });
      if (!res.ok) return { status: 'error', hasApiKey: false };
      return await res.json();
    } catch {
      return { status: 'offline', hasApiKey: false };
    }
  }

  /**
   * Rasterizes an SVG string or SVG data URI to a PNG base64 string
   * to guarantee maximum multimodal compatibility with vision models.
   */
  static async svgToPngBase64(svgDataUri: string): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context not available'));
        }
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve({
          base64: dataUrl,
          mimeType: 'image/png',
        });
      };
      img.onerror = () => {
        reject(new Error('Failed to rasterize SVG image'));
      };
      img.src = svgDataUri;
    });
  }

  /**
   * Reads a browser File object as a base64 Data URL, automatically
   * optimizing oversized camera/phone photos to max 1600px dimension.
   */
  static readFileAsBase64(file: File): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;

        // If file is SVG, return directly
        if (file.type === 'image/svg+xml') {
          resolve({ base64: result, mimeType: file.type });
          return;
        }

        // Optimize high-res photos to prevent huge base64 payloads
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.naturalWidth;
          let height = img.naturalHeight;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.9);
              resolve({ base64: compressed, mimeType: 'image/jpeg' });
              return;
            }
          }

          // If within bounds, return original
          resolve({
            base64: result,
            mimeType: file.type || 'image/jpeg',
          });
        };

        img.onerror = () => {
          // Fallback to original read result if image element fails
          resolve({
            base64: result,
            mimeType: file.type || 'image/jpeg',
          });
        };

        img.src = result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
