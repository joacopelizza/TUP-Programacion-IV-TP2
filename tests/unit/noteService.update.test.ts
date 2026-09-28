import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NoteServiceImpl } from '../../src/services/NoteService';
import { SqliteNoteRepository } from '../../src/repositories/NoteRepository';
import { createDb } from '../../src/db/connection';

// 🔴EJERCICIO 4: modificar nota (patch parcial).
// Creo las notas con el repo directamente para no depender de createNote.

describe('NoteService - updateNote (Ejercicio 4)', () => {
  let service: NoteServiceImpl;
  let repo: SqliteNoteRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    repo = new SqliteNoteRepository(db);
    service = new NoteServiceImpl(repo);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('actualiza solo el title y deja intactos content y pinned', () => {
    const original = repo.create({ title: 'Comprar pan', content: 'Antes de las 20hs' });

    const updated = service.updateNote(original.id, { title: 'Comprar facturas' });

    expect(updated).toBeDefined();
    expect(updated?.title).toBe('Comprar facturas');
    expect(updated?.content).toBe('Antes de las 20hs');
    expect(updated?.pinned).toBe(false);
  });

  it('actualiza solo el content y deja intacto el title', () => {
    const original = repo.create({ title: 'Comprar pan', content: 'Antes de las 20hs' });

    const updated = service.updateNote(original.id, { content: 'Antes de las 21hs' });

    expect(updated?.content).toBe('Antes de las 21hs');
    expect(updated?.title).toBe('Comprar pan');
  });

  it('actualiza solo pinned y deja intactos title y content', () => {
    const original = repo.create({ title: 'Comprar pan', content: 'Antes de las 20hs' });

    const updated = service.updateNote(original.id, { pinned: true });

    expect(updated?.pinned).toBe(true);
    expect(updated?.title).toBe('Comprar pan');
    expect(updated?.content).toBe('Antes de las 20hs');
  });

  it('actualiza varios campos a la vez', () => {
    const original = repo.create({ title: 'A', content: 'B' });

    const updated = service.updateNote(original.id, { title: 'C', content: 'D', pinned: true });

    expect(updated).toMatchObject({ id: original.id, title: 'C', content: 'D', pinned: true });
  });

  it('un patch vacío devuelve la nota sin cambios en sus datos', () => {
    const original = repo.create({ title: 'A', content: 'B', pinned: true });

    const updated = service.updateNote(original.id, {});

    expect(updated?.title).toBe('A');
    expect(updated?.content).toBe('B');
    expect(updated?.pinned).toBe(true);
  });

  it('ignora los campos con valor undefined (no pisa los datos existentes)', () => {
    const original = repo.create({ title: 'Original', content: 'Contenido' });

    const updated = service.updateNote(original.id, { title: undefined, content: 'Nuevo' });

    expect(updated?.title).toBe('Original');
    expect(updated?.content).toBe('Nuevo');
  });

  it('mantiene id y createdAt, y actualiza updatedAt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00.000Z'));
    const original = repo.create({ title: 'A', content: 'B' });

    vi.setSystemTime(new Date('2026-01-01T11:00:00.000Z'));
    const updated = service.updateNote(original.id, { content: 'C' });

    expect(updated?.id).toBe(original.id);
    expect(updated?.createdAt).toBe('2026-01-01T10:00:00.000Z');
    expect(updated?.updatedAt).toBe('2026-01-01T11:00:00.000Z');
  });

  it('persiste el cambio en el repositorio', () => {
    const original = repo.create({ title: 'A', content: 'B' });

    service.updateNote(original.id, { title: 'Nuevo título' });

    expect(repo.findById(original.id)?.title).toBe('Nuevo título');
  });

  it('devuelve undefined si el id no existe', () => {
    expect(service.updateNote(999, { title: 'X' })).toBeUndefined();
  });

  it('no modifica las demás notas', () => {
    const a = repo.create({ title: 'A', content: 'a' });
    const b = repo.create({ title: 'B', content: 'b' });

    service.updateNote(a.id, { title: 'A2' });

    expect(repo.findById(b.id)).toEqual(b);
  });
});
