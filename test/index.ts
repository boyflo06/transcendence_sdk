import { promisify } from "util";
import DataBase from "../database";
import * as fs from "fs"
import { pipeline } from "stream";

async function main() {
	const db = new DataBase();
	
	//GetList
	console.log(await db.collection("users").getList(1, 30, {
		filter: "name = 'jake' AND (email = 'jake' OR email = 'exactlyyyy')"
	}));
	
	
	//GetOne
	//console.log(await db.collection("users").getOne("9"))

	//Create
	//const data = fs.readFileSync("./test/Random_person_image.png");

	/* console.log(await db.collection("users").create({
		name: "testavatar",
		email: "test@gmail.com",
		avatar: new File([data], "test_avatar.png"),
		pwd: "pwd secret shhhh",
	})); */

	/* const data = fs.readFileSync("./test/Random_person_image.png");
	//const data = fs.readFileSync("./test/user-default-avatar.png")
	console.log(await db.collection("users").update("16", {
		avatar: new File([data], "test_avatar.png")
	})); */

	const user = await db.collection("users").getOne("16");
	console.log(db.getFileUrl("users", "16", user.avatar));
}

main();
