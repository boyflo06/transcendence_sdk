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
	item: T
}

export interface ListReturn<T = any> extends Return {
	items: T[],
}