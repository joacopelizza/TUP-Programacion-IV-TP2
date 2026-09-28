import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NoteServiceImpl } from '../../src/services/NoteService';
import { SqliteNoteRepository } from '../../src/repositories/NoteRepository';
import { createDb } from '../../src/db/connection';
import { notify } from '../../src/services/notificationService';

// Mockeamos el servicio de notificaciones para no enviar notificaciones reales
vi.mock('../../src/services/notificationService', () => ({
  notify: vi.fn(),
}));

describe('NoteService - notify (Ejercicio 6)', () => {
  let service: NoteServiceImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    const db = createDb(':memory:');
    const repo = new SqliteNoteRepository(db);
    service = new NoteServiceImpl(repo);
  });

  it('debe llamar a notify cuando se crea una nota fijada (pinned: true)', () => {
    const data = { title: 'Importante', content: 'No olvidar', pinned: true };
    const note = service.createNote(data);

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(note);
  });

  it('NO debe llamar a notify cuando la nota NO está fijada (pinned: false)', () => {
    const data = { title: 'Normal', content: 'Cualquier cosa', pinned: false };
    service.createNote(data);

    expect(notify).not.toHaveBeenCalled();
  });

  it('NO debe llamar a notify cuando pinned es omitido (por defecto false)', () => {
    const data = { title: 'Normal', content: 'Cualquier cosa' };
    service.createNote(data);

    expect(notify).not.toHaveBeenCalled();
  });
});
