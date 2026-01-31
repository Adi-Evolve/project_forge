// Compatibility shim: keep the googleDriveService API surface but delegate image uploads to ImgBB
// This lets existing callers continue to work while we remove full Drive integration.

import imgbbService from './imgbbService';

type ValidateResult = { valid: boolean; error?: string };

export const googleDriveService = {
	initialize: async (): Promise<boolean> => {
		// No Drive initialization required in the simplified stack
		return false;
	},

	authenticate: async (): Promise<boolean> => {
		return false;
	},

	validateFile: (file: File, maxSizeMB = 10, allowedTypes?: string[]): ValidateResult => {
		const maxSize = maxSizeMB * 1024 * 1024;
		if (file.size > maxSize) return { valid: false, error: 'File too large' };
		const allowed = allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
		if (!allowed.includes(file.type)) return { valid: false, error: 'Invalid file type' };
		return { valid: true };
	},

	uploadFile: async (file: File, metadata?: any) => {
		// If image -> upload to ImgBB and return a Drive-like shape
		if (file.type.startsWith('image/')) {
			const res = await imgbbService.uploadImage(file);
			return {
				success: res.success,
				fileId: res.success ? res.url : undefined,
				url: res.url,
				error: res.error
			};
		}

		// PDFs and other types are not supported by ImgBB in this shim
		return { success: false, error: 'Non-image file upload not supported in shim' };
	},

		uploadJSON: async (data: any, filename = 'data.json', metadata?: any) => {
			try {
				const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
				const base64 = Buffer.from(jsonString).toString('base64');
				const dataUrl = `data:application/json;base64,${base64}`;
				return { success: true, fileId: dataUrl, url: dataUrl };
			} catch (err: any) {
				return { success: false, error: err.message || String(err) };
			}
		},

	deleteFile: async (_fileId: string) => {
		return false;
	},

	getFileInfo: async (_fileId: string) => {
		return null;
	},

	createFolder: async (_name: string, _parentId?: string) => {
		return null;
	},

	getFileUrl: (fileId: string) => fileId,

	getDownloadUrl: (fileId: string) => fileId
};

export default googleDriveService;
