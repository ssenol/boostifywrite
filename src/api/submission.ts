// Yazma gönderimi ve OCR endpoint'leri
import { imageFormPart, request } from './client';
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
  formData.append('file', imageFormPart(imageUri, 'image.jpg'));

  const res = await request<ImageToTextResponse>('/question/image-to-text', {
    method: 'POST',
    body: formData,
    isFormData: true,
  });
  return res.imageText;
}
