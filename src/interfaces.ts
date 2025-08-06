export interface CommonOptions extends RequestInit {
	fields?: string;
}

export interface ListOptions extends CommonOptions {
	page?: number,
	perPage?: number,
	filter?: string,
}

export interface Return {
	status: number,
	error: any
}

export interface SingleReturn<T = any> extends Return {
	item?: T
}

export interface ListReturn<T = any> extends Return {
	items?: T[],
}

export interface AvatarUploadOptions extends CommonOptions {
	maxSize?: number;
	allowedTypes?: string[];
}

export interface AvatarUploadResponse {
	status: number;
	error?: any;
	path?: string;
	filename?: string;
	previousAvatar?: string;
}

export interface User {
	id: string;
	username?: string;
	email?: string;
	avatar?: string;
	[key: string]: any;
}