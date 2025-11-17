// src/types/jobbcoachen.ts

export interface MessageAttachment {
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  extracted_text: string;
  uploaded_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  attachments?: MessageAttachment[];
}
