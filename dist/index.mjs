// src/Collection.ts
var Collection = class {
  name;
  dbInstance;
  constructor(dbInstance, collectionName) {
    this.name = collectionName;
    this.dbInstance = dbInstance;
  }
  //Accessors
  /**
   * getName
   */
  getName() {
    return this.name;
  }
  /**
   * getDbInstance
   */
  getDbInstance() {
    return this.dbInstance;
  }
  //
  /**
   * getList
   */
  async getList(page = 1, perPage = 30, options) {
    options = Object.assign({ page, perPage }, options);
    const url = new URL(`http://database:3000/table/${this.name}/getList`);
    url.searchParams.append("page", `${options.page}`);
    url.searchParams.append("perPage", `${options.perPage}`);
    if (options.filter) url.searchParams.append("filter", options.filter);
    options = Object.assign({ method: "GET" }, options);
    const response = await fetch(url, options);
    const res = {
      status: response.status,
      error: response.ok ? void 0 : await response.json(),
      items: response.ok ? await response.json() : void 0
    };
    return res;
  }
  /**
   * getFirstListItem
   */
  async getFirstListItem(filter, options) {
    const url = new URL(`http://database:3000/table/${this.name}/getList`);
    url.searchParams.append("page", `1`);
    url.searchParams.append("perPage", `1`);
    url.searchParams.append("filter", filter);
    options = Object.assign({ method: "GET" }, options);
    const response = await fetch(url, options);
    const data = await response.json();
    const res = {
      status: response.status,
      error: void 0,
      item: void 0
    };
    if (response.ok) {
      if (!data.length || data.length === 0) {
        res.status = 404, res.error = {
          error: "Not Found",
          message: "The requested ressource was not found.",
          status: 404
        };
      } else {
        res.item = data[0];
      }
    } else {
      res.error = data;
    }
    return res;
  }
  /**
   * getOne
   */
  async getOne(id, options) {
    const url = new URL(`http://database:3000/table/${this.name}/getOne/${id}`);
    options = Object.assign({ method: "GET" }, options);
    const response = await fetch(url, options);
    const res = {
      status: response.status,
      error: response.ok ? void 0 : await response.json(),
      item: response.ok ? await response.json() : void 0
    };
    return res;
  }
  containsFile(obj) {
    for (const key in obj) {
      const values = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
      for (const val of values) {
        if (val instanceof File && typeof File !== "undefined" || val instanceof Blob && typeof Blob !== "undefined") {
          return true;
        }
      }
    }
    return false;
  }
  convertToFormData(object) {
    const form = new FormData();
    for (const key in object) {
      const val = object[key];
      if (typeof val === "undefined") continue;
      if (typeof val === "object" && !this.containsFile({ data: val })) {
        let payload = {};
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
  async create(body, options) {
    const url = new URL(`http://database:3000/table/${this.name}/create`);
    options = Object.assign({
      method: "POST",
      body
    }, options);
    if (options.body && options.body.constructor.name !== "FormData" && !(options.body instanceof FormData)) {
      options.body = this.convertToFormData(options.body);
    }
    const response = await fetch(url, options);
    return await response.json();
  }
  /**
   * update
   */
  async update(id, body, options) {
    const url = new URL(`http://database:3000/table/${this.name}/update/${id}`);
    options = Object.assign({
      method: "PATCH",
      body
    }, options);
    if (options.body && options.body.constructor.name !== "FormData" && !(options.body instanceof FormData)) {
      options.body = this.convertToFormData(options.body);
    }
    const response = await fetch(url, options);
    return await response.json();
  }
};
var Collection_default = Collection;

// src/DataBase.ts
var DataBase = class {
  constructor() {
  }
  /**
   * collection
   */
  collection(collectionName) {
    return new Collection_default(this, collectionName);
  }
  /**
   * getFileUrl
   */
  getFileUrl(collectionName, rowId, filename) {
    return new URL(`http://database:3000/files/${collectionName}/${rowId}/${filename}`);
  }
};
var DataBase_default = DataBase;

// src/index.ts
var index_default = DataBase_default;
export {
  index_default as default
};
