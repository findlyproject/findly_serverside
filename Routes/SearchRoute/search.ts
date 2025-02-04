import express from 'express'
import { UserSearch } from '../../Controller/commonFolders/searchController/userSearch'
import { errorCatch } from '../../Middleware/tryCatch'
const Searchrouter=express.Router()
Searchrouter
.get(`/usersearch`,errorCatch(UserSearch))


export{Searchrouter}