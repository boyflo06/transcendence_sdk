interface CommonOptions extends RequestInit {
    fields?: string;
}
interface ListOptions extends CommonOptions {
    page?: number;
    perPage?: number;
    filter?: string;
}
interface Return {
    status: number;
    error: any;
}
interface SingleReturn<T = any> extends Return {
    item?: T;
}
interface ListReturn<T = any> extends Return {
    items?: T[];
}
interface AvatarUploadOptions extends CommonOptions {
    maxSize?: number;
    allowedTypes?: string[];
}
interface AvatarUploadResponse {
    status: number;
    error?: any;
    path?: string;
    filename?: string;
    previousAvatar?: string;
}
interface User {
    id: string;
    username?: string;
    email?: string;
    avatar?: string;
    [key: string]: any;
}

declare class Collection {
    private name;
    private dbInstance;
    constructor(dbInstance: DataBase, collectionName: string);
    /**
     * getName
     */
    getName(): string;
    /**
     * getDbInstance
     */
    getDbInstance(): DataBase;
    /**
     * getList
     */
    getList<T = any>(page?: number, perPage?: number, options?: ListOptions): Promise<ListReturn<T>>;
    /**
     * getFirstListItem
     */
    getFirstListItem<T = any>(filter: string, options?: CommonOptions): Promise<SingleReturn<T>>;
    /**
     * getOne
     */
    getOne<T = any>(id: string, options?: CommonOptions): Promise<SingleReturn<T>>;
    private containsFile;
    private convertToFormData;
    create<T = any>(body: {
        [key: string]: any;
    } | FormData, options?: CommonOptions): Promise<SingleReturn<T>>;
    /**
     * update
     */
    update<T = any>(id: string, body?: {
        [key: string]: any;
    } | FormData, options?: CommonOptions): Promise<SingleReturn<T>>;
    /**
     * delete
     */
    delete<T = any>(id: string, options?: CommonOptions): Promise<SingleReturn<T>>;
    /**
     * Upload Avatar
     * @deprecated use update (or create); usage -> ```...update(userid, {avatar: imageFile}, options);```
     */
    uploadAvatar(userId: string, imageFile: File, options?: AvatarUploadOptions): Promise<AvatarUploadResponse>;
    /**
     * RemoveAvatar
    */
    removeAvatar(userId: string, options?: CommonOptions): Promise<SingleReturn<User>>;
    /**
     * Avatar format and size validation
     */
    private validateAvatarFile;
    private deletePhysicalFile;
}

declare class DataBase {
    constructor();
    /**
     * collection
     */
    collection(collectionName: string): Collection;
    users(): Collection;
    /**
     * getFileUrl
     */
    getFileUrl(collectionName: string, rowId: string, filename: string): URL;
}

export { type AvatarUploadOptions, type AvatarUploadResponse, type User, DataBase as default };
