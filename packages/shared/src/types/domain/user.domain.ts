import type { Admin } from './admin.domain.js';
import type { Organizer } from './organizer.domain.js';
import type { Cyclist } from './cyclist.domain.js';

export type User = Admin | Organizer | Cyclist;
