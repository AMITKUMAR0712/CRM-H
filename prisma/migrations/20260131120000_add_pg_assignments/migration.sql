-- CreateTable
CREATE TABLE `pg_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `pgId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pg_assignments_pgId_userId_key`(`pgId`, `userId`),
    INDEX `pg_assignments_pgId_idx`(`pgId`),
    INDEX `pg_assignments_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pg_assignments` ADD CONSTRAINT `pg_assignments_pgId_fkey` FOREIGN KEY (`pgId`) REFERENCES `pgs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pg_assignments` ADD CONSTRAINT `pg_assignments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
