// Yazma gönderimi ve OCR endpoint'leri
import { request } from './client';
import type { SubmitWritingResponse, ImageToTextResponse } from '@/types/api';

export async function submitWriting(
  userResponse: string,
  exerciseToken: string,
): Promise<SubmitWritingResponse> {
  return request<SubmitWritingResponse>('/student/submit-writing-task', {
    method: 'POST',
    body: { userResponse },
    token: exerciseToken,
  });
}

export async function imageToText(imageUri: string): Promise<string> {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() ?? 'image.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg',
    png: 'image/png', gif: 'image/gif', webp: 'image/webp',
  };
  formData.append('file', {
    uri: imageUri,
    name: filename,
    type: mimeMap[ext] ?? 'image/jpeg',
  } as unknown as Blob);

  const res = await request<ImageToTextResponse>('/question/image-to-text', {
    method: 'POST',
    body: formData,
    isFormData: true,
  });
  return res.imageText;
}
