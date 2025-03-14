import {DefaultCrudRepository} from "@loopback/repository";
import {User} from "../models/user.model";
import {inject} from "@loopback/core";
import {PostgresDataSource} from "../datasources";

export class UserRepository extends DefaultCrudRepository<User, typeof User.prototype.id>{
    constructor(@inject('datasources.postgres') dataSource: PostgresDataSource) {
        super(User, dataSource);
    }
}