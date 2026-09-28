import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';

// 🔴 EJERCICIO 4: integración de PATCH /notes/:id.
// Las notas se crean con POST /notes, así que depende de createNote (Ej. 1).

describe('PATCH /notes/:id (Ejercicio 4)', () => {
  let app: ReturnType<typeof makeApp>;

  beforeEach(() => {
    app = makeApp(':memory:');
  });

  async function crearNota(data: { title: string; content: string; pinned?: boolean }) {
    const res = await request(app).post('/notes').send(data);
    return res.body as { id: number; title: string; content: string; pinned: boolean };
  }

  it('200: actualiza solo content y deja el resto igual', async () => {
    const nota = await crearNota({ title: 'Comprar pan', content: 'Antes de las 20hs' });

    const res = await request(app)
      .patch(`/notes/${nota.id}`)
      .send({ content: 'Antes de las 21hs' });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(nota.id);
    expect(res.body.content).toBe('Antes de las 21hs');
    expect(res.body.title).toBe('Comprar pan');
    expect(res.body.pinned).toBe(false);
  });

  it('200: actualiza pinned', async () => {
    const nota = await crearNota({ title: 'A', content: 'B' });

    const res = await request(app).patch(`/notes/${nota.id}`).send({ pinned: true });

    expect(res.status).toBe(200);
    expect(res.body.pinned).toBe(true);
    expect(res.body.title).toBe('A');
  });

  it('el cambio queda guardado (se ve en GET /notes)', async () => {
    const nota = await crearNota({ title: 'A', content: 'B' });

    await request(app).patch(`/notes/${nota.id}`).send({ title: 'Nuevo título' });
    const lista = await request(app).get('/notes');

    expect(lista.status).toBe(200);
    expect(lista.body).toHaveLength(1);
    expect(lista.body[0].title).toBe('Nuevo título');
  });

  it('404: el id no existe', async () => {
    const res = await request(app).patch('/notes/999').send({ title: 'X' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'NotFound' });
  });

  it('400: title vacío', async () => {
    const nota = await crearNota({ title: 'A', content: 'B' });

    const res = await request(app).patch(`/notes/${nota.id}`).send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  it('400: pinned con tipo inválido', async () => {
    const nota = await crearNota({ title: 'A', content: 'B' });

    const res = await request(app).patch(`/notes/${nota.id}`).send({ pinned: 'si' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });
});

// ej 5: DELETE /notes/:id
describe('Rutas DELETE /notes/:id (Ejercicio 5)', () => {
  let app: ReturnType<typeof makeApp>;

  beforeEach(() => {
    app = makeApp(':memory:');
  });

  it('DELETE /notes/:id debe eliminar la nota y devolver status 204', async () => {
    const created = await request(app)
      .post('/notes')
      .send({ title: 'A borrar', content: 'Chao' });

    const res = await request(app).delete(`/notes/${created.body.id}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /notes/:id debe responder 404 si la nota no existe', async () => {
    const res = await request(app).delete('/notes/9999');
    expect(res.status).toBe(404);
  });
});
