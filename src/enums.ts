// local
import { makeEnum } from './enum';

/**
 * The http method types
 */
export const HttpMethod = makeEnum({
  /** A get request */
  Get: 'GET',
  /** A post request */
  Post: 'POST',
  /** A delete request */
  Delete: 'DELETE',
  /** A put request */
  Put: 'PUT',
  /** A patch request */
  Patch: 'PATCH',
});

/**
 * Override to cast as string
 */
export type HttpMethod = typeof HttpMethod[keyof typeof HttpMethod];
