import Collection from "./Collection";

class DataBase {
	constructor() {

	}

	/**
	 * collection
	 */
	public collection(collectionName: string): Collection {
		return (new Collection(this, collectionName));
	}

	/**
	 * getFileUrl
	 */
	public getFileUrl(collectionName: string, rowId: string, filename: string): URL {
		return new URL(`http://database:3000/files/${collectionName}/${rowId}/${filename}`);
	}
}

export default DataBase