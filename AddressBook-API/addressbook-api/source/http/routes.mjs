import { Router } from 'express';
import * as action from '../actions/contacts.mjs';
import { checkInput } from './input.mjs';
const routes = Router();
routes.route('/').get(action.list).post(checkInput, action.add);
routes.route('/:id').get(action.get).put(checkInput, action.update).delete(action.remove);
export default routes;
