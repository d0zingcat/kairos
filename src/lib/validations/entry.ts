import { createInsertSchema } from "drizzle-zod"
import { books, music, watches, games } from "@/db/schema"
import { z } from "zod"

export const bookSchema = createInsertSchema(books, {
    title: (s) => s.min(1, "标题不能为空"),
    coverUrl: (s) => s.url().nullable().or(z.literal("")).optional(),
    startDate: (s) => s.regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    finishDate: (s) => s.regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
}).omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    moderationStatus: true,
})

export const musicSchema = createInsertSchema(music, {
    title: (s) => s.min(1, "名称不能为空"),
    coverUrl: (s) => s.url().nullable().or(z.literal("")).optional(),
    listenDate: (s) => s.regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
}).omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    moderationStatus: true,
})

export const watchSchema = createInsertSchema(watches, {
    title: (s) => s.min(1, "名称不能为空"),
    posterUrl: (s) => s.url().nullable().or(z.literal("")).optional(),
    seasonNumber: () => z.number().int().positive("季数必须大于 0").nullable().optional(),
    watchDate: (s) => s.regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
}).omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    moderationStatus: true,
})

export const gameSchema = createInsertSchema(games, {
    title: (s) => s.min(1, "名称不能为空"),
    coverUrl: (s) => s.url().nullable().or(z.literal("")).optional(),
    startDate: (s) => s.regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    finishDate: (s) => s.regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
}).omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    moderationStatus: true,
})
