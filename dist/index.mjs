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
    let items, error;
    if (response.ok) {
      const text = await response.text();
      items = text ? JSON.parse(text) : void 0;
    } else {
      try {
        const text = await response.text();
        error = text ? JSON.parse(text) : void 0;
      } catch (e) {
        error = { message: e };
      }
    }
    return { status: response.status, error, items };
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
    let item, error;
    if (response.ok) {
      const text = await response.text();
      item = text ? JSON.parse(text) : void 0;
    } else {
      try {
        const text = await response.text();
        error = text ? JSON.parse(text) : void 0;
      } catch (e) {
        error = { message: e };
      }
    }
    return { status: response.status, error, item };
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
    let item, error;
    if (response.ok) {
      const text = await response.text();
      item = text ? JSON.parse(text) : void 0;
    } else {
      try {
        const text = await response.text();
        error = text ? JSON.parse(text) : void 0;
      } catch (e) {
        error = { message: e };
      }
    }
    return { status: response.status, error, item };
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
    let item, error;
    if (response.ok) {
      const text = await response.text();
      item = text ? JSON.parse(text) : void 0;
    } else {
      try {
        const text = await response.text();
        error = text ? JSON.parse(text) : void 0;
      } catch (e) {
        error = { message: e };
      }
    }
    return { status: response.status, error, item };
  }
  /**
   * delete
   */
  async delete(id, options) {
    const url = new URL(`http://database:3000/table/${this.name}/delete/${id}`);
    options = Object.assign({
      method: "DELETE"
    }, options);
    const response = await fetch(url, options);
    let item, error;
    if (response.ok) {
      const text = await response.text();
      item = text ? JSON.parse(text) : void 0;
    } else {
      try {
        const text = await response.text();
        error = text ? JSON.parse(text) : void 0;
      } catch (e) {
        error = { message: e };
      }
    }
    return { status: response.status, error, item };
  }
  /**
   * Upload Avatar
   * @deprecated use update (or create); usage -> ```...update(userid, {avatar: imageFile}, options);```
   */
  async uploadAvatar(userId, imageFile, options) {
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
      const user = await this.getOne(userId);
      const oldAvatar = user.item?.avatar;
      const formData = new FormData();
      formData.append("avatar", imageFile);
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
  async removeAvatar(userId, options) {
    try {
      const currentUser = await this.getOne(userId);
      if (currentUser.error || !currentUser.item?.avatar) {
        return {
          status: 404,
          error: { error: "Not Found", message: "Aucun avatar \xE0 supprimer", status: 404 }
        };
      }
      const avatarToDelete = currentUser.item.avatar;
      const result = await this.update(userId, { avatar: null }, options);
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
  validateAvatarFile(file, options) {
    if (!file) {
      return { valid: false, error: "Aucun fichier fourni" };
    }
    file;
    if (!file.type.startsWith("image/")) {
      return { valid: false, error: "Le fichier doit \xEAtre une image" };
    }
    file;
    const allowedTypes = options?.allowedTypes || ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Type d'image non autoris\xE9. Types accept\xE9s: ${allowedTypes.join(", ")}`
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
  async deletePhysicalFile(filename) {
    try {
      await fetch(`http://database:3000/files/delete/${filename}`, {
        method: "DELETE"
      });
    } catch (error) {
      console.warn("Impossible de supprimer le fichier:", filename, error);
    }
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
  users() {
    return this.collection("users");
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
