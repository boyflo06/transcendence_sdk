import DataBase from "./DataBase";
import { CommonOptions, ListOptions, ListReturn, SingleReturn, AvatarUploadOptions, AvatarUploadResponse, User } from "./interfaces";

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
	public async getList<T = any>(page: number = 1, perPage: number = 30, options?: ListOptions): Promise<ListReturn<T>> {
		//const url = encodeURI(`http://database:3000/table/${this.name}/getList?page=${page}&perPage=${perPage}`);

		options = Object.assign({ page: page, perPage: perPage }, options);

		const url = new URL(`http://database:3000/table/${this.name}/getList`);
		url.searchParams.append("page", `${options.page}`);
		url.searchParams.append("perPage", `${options.perPage}`);
		if (options.filter) url.searchParams.append("filter", options.filter);

		options = Object.assign({ method: "GET" }, options);

		const response = await fetch(url, options);
		const res: ListReturn<T> = {
			status: response.status,
			error: response.ok ? undefined : await response.json(),
			items: response.ok ? await response.json() : undefined
		}
		return (res);
	}

	/**
	 * getFirstListItem
	 */
	public async getFirstListItem<T = any>(filter: string, options?: CommonOptions): Promise<SingleReturn<T>> {
		const url = new URL(`http://database:3000/table/${this.name}/getList`);
		url.searchParams.append("page", `1`);
		url.searchParams.append("perPage", `1`);
		url.searchParams.append("filter", filter);

		options = Object.assign({ method: "GET" }, options);

		const response = await fetch(url, options);
		const data = await response.json();
		const res: SingleReturn<T> = {
			status: response.status,
			error: undefined,
			item: undefined
		}
		if (response.ok) {
			if (!data.length || data.length === 0) {
				res.status = 404,
					res.error = {
						error: "Not Found",
						message: "The requested ressource was not found.",
						status: 404
					}
			} else {
				res.item = data[0];
			}
		} else {
			res.error = data;
		}
		/* if (res.status === 200 && (!data.length || data.length === 0)) {
			res.status = 404,
			res.error = {
				error: "Not Found",
				message: "The requested ressource was not found.",
				status: 404
			}
		} else if (res.status === 200) {
			res.item = data[0];
		} */
		return res;
	}

	/**
	 * getOne
	 */
	public async getOne<T = any>(id: string, options?: CommonOptions): Promise<SingleReturn<T>> {
		const url = new URL(`http://database:3000/table/${this.name}/getOne/${id}`);

		options = Object.assign({ method: "GET" }, options);
		const response = await fetch(url, options);
		const res: SingleReturn<T> = {
			status: response.status,
			error: response.ok ? undefined : await response.json(),
			item: response.ok ? await response.json() : undefined
		}
		return (res);
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

			if (typeof val === "object" && !this.containsFile({ data: val })) {
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

	public async create<T = any>(body: { [key: string]: any } | FormData, options?: CommonOptions): Promise<SingleReturn<T>> {
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
		const res: SingleReturn<T> = {
			status: response.status,
			error: response.ok ? undefined : await response.json(),
			item: response.ok ? await response.json() : undefined
		}
		return (res);
	}

	/**
	 * update
	 */
	public async update<T = any>(id: string, body?: { [key: string]: any } | FormData, options?: CommonOptions): Promise<SingleReturn<T>> {
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
		const res: SingleReturn<T> = {
			status: response.status,
			error: response.ok ? undefined : await response.json(),
			item: response.ok ? await response.json() : undefined
		}
		return (res);
	}

	/**
	 * delete
	 */
	public async delete<T = any>(id: string, options?: CommonOptions): Promise<SingleReturn<T>> {
		const url = new URL(`http://database:3000/table/${this.name}/delete/${id}`);
		options = Object.assign({
			method: "DELETE"
		}, options);

		const response = await fetch(url, options);
		const res: SingleReturn<T> = {
			status: response.status,
			error: response.ok ? undefined : await response.json(),
			item: response.ok ? await response.json() : undefined
		}
		return (res);
	}

	/**
	 * Upload Avatar
	 */
	public async uploadAvatar(userId: string, imageFile: File, options?: AvatarUploadOptions): Promise<AvatarUploadResponse> {
		// Validation du fichier
		const validation = this.validateAvatarFile(imageFile, options);
		if (!validation.valid) {
			return {
				status: 400,
				error: {
					error: "Bad Request",
					message: validation.error,
					status: 400
				}
			};
		}
		try {
			const user = await this.getOne<User>(userId);
			const oldAvatar = user.item?.avatar;

			const formData = new FormData();
			formData.append('avatar', imageFile);

			const url = new URL(`http://database:3000/table/${this.name}/update/${userId}`);
			const response = await fetch(url, {
				method: "PATCH",
				body: formData,
				...options
			});

			const data = await response.json();

			if (response.ok) {
				if (oldAvatar && oldAvatar !== data.avatar) {
					await this.deletePhysicalFile(oldAvatar);
				}

				return {
					status: response.status,
					path: this.dbInstance.getFileUrl(this.name, userId, data.avatar).toString(),
					filename: data.avatar,
					previousAvatar: oldAvatar
				};
			} else {
				return { status: response.status, error: data };
			}
		} catch (error) {
			return {
				status: 500,
				error: {
					error: "Internal Server Error",
					message: "Erreur lors de l'upload de l'avatar",
					status: 500
				}
			};
		}
	}
	/** 
	 * RemoveAvatar
	*/

	public async removeAvatar(userId: string, options?: CommonOptions): Promise<SingleReturn<User>> {
    try {
        const currentUser = await this.getOne<User>(userId);
        if (currentUser.error || !currentUser.item?.avatar) {
            return {
                status: 404,
                error: { error: "Not Found", message: "Aucun avatar à supprimer", status: 404 }
            };
        }

        const avatarToDelete = currentUser.item.avatar;

        const result = await this.update<User>(userId, { avatar: null }, options);

        await this.deletePhysicalFile(avatarToDelete);

        return result;
    } catch (error) {
        return {
            status: 500,
            error: {
                error: "Internal Server Error",
                message: "Erreur lors de la suppression de l'avatar",
                status: 500
            }
        };
    }
}

	/**
	 * Avatar format and size validation
	 */
	private validateAvatarFile(file: File, options?: AvatarUploadOptions): { valid: boolean; error?: string } {
		if (!file) {
			return { valid: false, error: "Aucun fichier fourni" };
		} file

		if (!file.type.startsWith('image/')) {
			return { valid: false, error: "Le fichier doit être une image" };
		} file

		const allowedTypes = options?.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			return {
				valid: false,
				error: `Type d'image non autorisé. Types acceptés: ${allowedTypes.join(', ')}`
			};
		}

		const maxSize = options?.maxSize || 5 * 1024 * 1024;
		if (file.size > maxSize) {
			return {
				valid: false,
				error: `Image trop volumineuse. Taille maximale: ${Math.round(maxSize / (1024 * 1024))}MB`
			};
		}

		return { valid: true };
	}

	private async deletePhysicalFile(filename: string): Promise<void> {
		try {
			await fetch(`http://database:3000/files/delete/${filename}`, {
				method: 'DELETE'
			});
		} catch (error) {
			console.warn('Impossible de supprimer le fichier:', filename, error);
		}
	}
}




export default Collection