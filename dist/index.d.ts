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
    } | FormData, options?: CommonOptions): Promise<T>;
    /**
     * update
     */
    update<T = any>(id: string, body?: {
        [key: string]: any;
    } | FormData, options?: CommonOptions): Promise<T>;
}

declare class DataBase {
    constructor();
    /**
     * collection
     */
    collection(collectionName: string): Collection;
    /**
     * getFileUrl
     */
    getFileUrl(collectionName: string, rowId: string, filename: string): URL;
}

export { DataBase as default };
