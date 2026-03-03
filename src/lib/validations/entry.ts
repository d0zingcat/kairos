import { z } from "zod"

export const bookSchema = z.object({
    externalId: z.string().nullable().optional(),
    title: z.string().min(1, "标题不能为空"),
    subtitle: z.string().nullable().optional(),
    authors: z.array(z.string()).nullable().optional(),
    coverUrl: z.string().url().nullable().or(z.literal("")).optional(),
    isbn: z.string().nullable().optional(),
    pageCount: z.number().int().nonnegative().nullable().optional(),
    status: z.enum(["want_to_read", "reading", "finished", "abandoned"]).optional(),
    rating: z.number().int().min(0).max(10).nullable().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    finishDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    notes: z.string().nullable().optional(),
    favorite: z.boolean().optional(),
    tags: z.array(z.string()).nullable().optional(),
})

export const musicSchema = z.object({
    externalId: z.string().nullable().optional(),
    type: z.enum(["track", "album"]).optional(),
    title: z.string().min(1, "名称不能为空"),
    artist: z.string().nullable().optional(),
    albumTitle: z.string().nullable().optional(),
    coverUrl: z.string().url().nullable().or(z.literal("")).optional(),
    genre: z.array(z.string()).nullable().optional(),
    rating: z.number().int().min(0).max(10).nullable().optional(),
    listenDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    favorite: z.boolean().optional(),
    notes: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
})

export const watchSchema = z.object({
    externalId: z.string().nullable().optional(),
    type: z.enum(["movie", "tv"]).optional(),
    title: z.string().min(1, "名称不能为空"),
    posterUrl: z.string().url().nullable().or(z.literal("")).optional(),
    director: z.string().nullable().optional(),
    genre: z.array(z.string()).nullable().optional(),
    runtime: z.number().int().nonnegative().nullable().optional(),
    rating: z.number().int().min(0).max(10).nullable().optional(),
    watchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    seasonNumber: z.number().int().nonnegative().nullable().optional(),
    episodeNumber: z.number().int().nonnegative().nullable().optional(),
    status: z.enum(["want_to_watch", "watching", "finished", "abandoned"]).optional(),
    favorite: z.boolean().optional(),
    notes: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
})

export const gameSchema = z.object({
    externalId: z.string().nullable().optional(),
    title: z.string().min(1, "名称不能为空"),
    coverUrl: z.string().url().nullable().or(z.literal("")).optional(),
    platforms: z.array(z.string()).nullable().optional(),
    genre: z.array(z.string()).nullable().optional(),
    developer: z.string().nullable().optional(),
    rating: z.number().int().min(0).max(10).nullable().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    finishDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    playTimeMinutes: z.number().int().nonnegative().nullable().optional(),
    status: z.enum(["backlog", "playing", "completed", "abandoned", "platinum"]).optional(),
    favorite: z.boolean().optional(),
    notes: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
})
