import express from 'express'
import { UserSearch } from '../../Controller/commonFolders/searchController/userSearch'
import { errorCatch } from '../../Middleware/tryCatch'
const Searchrouter=express.Router()
Searchrouter
.get(`/search`,errorCatch(UserSearch))


export{Searchrouter}