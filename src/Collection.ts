import DataBase from "./DataBase";
import { CommonOptions, ListOptions } from "./interfaces";

class Collection {
	private name: string;
	private dbInstance: DataBase;

	constructor(dbInstance: DataBase, collectionName: string) {
		this.name = collectionName;
		this.dbInstance = dbInstance;
	}

	//Accessors
	/**
	 * getName
	 */
	public getName(): string {
		return (this.name);
	}
	/**
	 * getDbInstance
	 */
	public getDbInstance(): DataBase {
		return this.dbInstance;
	}

	//
	/**
	 * getList
	 */
	public async getList<T = any>(page: number = 1, perPage: number = 30, options?: ListOptions): Promise<T> {
		//const url = encodeURI(`http://database:3000/table/${this.name}/getList?page=${page}&perPage=${perPage}`);

		options = Object.assign({ page: page, perPage: perPage }, options);

		const url = new URL(`http://database:3000/table/${this.name}/getList`);
		url.searchParams.append("page", `${options.page}`);
		url.searchParams.append("perPage", `${options.perPage}`);
		if (options.filter) url.searchParams.append("filter", options.filter);

		options = Object.assign({ method: "GET" }, options);

		const response = await fetch(url, options);
		return (await response.json() as T);
	}

	/**
	 * getFirstListItem
	 */
	public async getFirstListItem<T = any>(filter: string, options?: CommonOptions): Promise<T> {
		const url = new URL(`http://database:3000/table/${this.name}/getList`);
		url.searchParams.append("page", `1`);
		url.searchParams.append("perPage", `1`);
		url.searchParams.append("filter", filter);

		options = Object.assign({ method: "GET" }, options);

		const response = (await (await fetch(url, options)).json());
		if (!response?.length) {
			throw new Error("Not Found", {
				cause: 404 
			});
		}
		return response[0] as T;
	}

	/**
	 * getOne
	 */
	public async getOne<T = any>(id: string, options?: CommonOptions): Promise<T> {
		const url = new URL(`http://database:3000/table/${this.name}/getOne/${id}`);

		options = Object.assign({ method: "GET" }, options);
		const response = await fetch(url, options);
		//console.log(response);
		return (await response.json() as T);
	}

	private containsFile(obj: any): boolean {
		for (const key in obj) {
			const values = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
			for (const val of values) {
				if ((val instanceof File && typeof File !== "undefined")
					|| (val instanceof Blob && typeof Blob !== "undefined")) {
					return true;
				}
			}
		}
		return false;
	}

	private convertToFormData(object: any): FormData {
		const form = new FormData();

		for (const key in object) {
			const val = object[key];
			if (typeof val === "undefined") continue;

			if (typeof val === "object" && !this.containsFile({data: val})) {
				let payload: { [key: string]: string } = {};
				payload[key] = val;
				form.append("@jsonPayload", JSON.stringify(payload));
			} else {
				const arrayedVal = Array.isArray(val) ? val : [val];
				for (let arrval of arrayedVal) {
					form.append(key, arrval);
				}
			}
		}
		return form;
	}

	public async create<T = any>(body: { [key: string]: any } | FormData, options?: CommonOptions): Promise<T> {
		const url = new URL(`http://database:3000/table/${this.name}/create`);

		options = Object.assign({
			method: "POST",
			body: body
		}, options);

		if (options.body && options.body.constructor.name !== "FormData" 
			&& !(options.body instanceof FormData)) {
			options.body = this.convertToFormData(options.body);
		}

		const response = await fetch(url, options);
		return (await response.json() as T);
	}

	/**
	 * update
	 */
	public async update<T = any>(id: string, body?: { [key: string]: any } | FormData, options?: CommonOptions): Promise<T> {
		const url = new URL(`http://database:3000/table/${this.name}/update/${id}`);

		options = Object.assign({
			method: "PATCH",
			body: body
		}, options);
		if (options.body && options.body.constructor.name !== "FormData" 
			&& !(options.body instanceof FormData)) {
			options.body = this.convertToFormData(options.body);
		}

		const response = await fetch(url, options);
		return (await response.json() as T);
	}
}

export default Collection