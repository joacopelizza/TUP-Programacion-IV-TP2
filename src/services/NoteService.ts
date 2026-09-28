import { NoteRepository } from '../repositories/NoteRepository';
import { Note, NewNote, NotePatch } from '../models/Note';
import { notify } from './notificationService';

// Contrato fijo. Las rutas (src/routes/notes.ts) y los tests de la cátedra
// llaman a estos 5 métodos por su nombre exacto: no los renombren.
export interface NoteService {
  createNote(data: NewNote): Note;
  listNotes(): Note[];
  getNote(id: number): Note | undefined;
  updateNote(id: number, patch: NotePatch): Note | undefined;
  deleteNote(id: number): boolean;
}

export class NoteServiceImpl implements NoteService {
  constructor(private readonly repo: NoteRepository) {}

  createNote(data: NewNote): Note {
    // 1. Primero creamos la nota y la guardamos en una variable
    const note = this.repo.create(data);

    // 2. Ahora chequeamos si la nota fue creada como "pinned"
    if (note.pinned) {
      notify(note);
    }

    // 3. Finalmente devolvemos la nota
    return note;
  }
    // 🔴🟢 EJERCICIO 6 (a hacer más adelante, ustedes escriben el test):
    // una vez que este método esté en verde, agréguenle: si `data.pinned`
    // es true, además deben llamar a notify(nota) del módulo
    // notificationService. En el test, simulen ese módulo completo con
    // vi.mock y verifiquen la llamada con toHaveBeenCalledWith.
  listNotes(): Note[] {
    // 🟢 EJERCICIO 2: esta función YA FUNCIONA.
    // No existe todavía el archivo tests/unit/noteService.list.test.ts:
    // escríbanlo ustedes cubriendo al menos "lista vacía" y "varias notas".
    return this.repo.findAll();
  }

  getNote(id: number): Note | undefined {
    // 🔴🟢 EJERCICIO 3: ciclo completo (test + implementación).
    console.log('getNote: id =', id);
    const note = this.repo.findById(id);
    return note;
  }

  updateNote(id: number, patch: NotePatch): Note | undefined {
    const cleanPatch: NotePatch = {};
    if (patch.title !== undefined) cleanPatch.title = patch.title;
    if (patch.content !== undefined) cleanPatch.content = patch.content;
    if (patch.pinned !== undefined) cleanPatch.pinned = patch.pinned;

    return this.repo.update(id, cleanPatch);
  }

  deleteNote(id: number): boolean {
    return this.repo.delete(id);
  }
}
