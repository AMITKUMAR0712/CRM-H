/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `chat_threads` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `chat_threads` DROP FOREIGN KEY `chat_threads_assignedToId_fkey`;

-- DropIndex
DROP INDEX `chat_threads_assignedToId_idx` ON `chat_threads`;

-- AlterTable
ALTER TABLE `chat_threads` DROP COLUMN `assignedToId`;

-- AlterTable
ALTER TABLE `gallery_images` ADD COLUMN `availability` VARCHAR(60) NULL,
    ADD COLUMN `floor` INTEGER NULL,
    ADD COLUMN `roomType` ENUM('SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_SHARING') NULL;

-- AlterTable
ALTER TABLE `pgs` ADD COLUMN `approvalStatus` ENUM('PENDING', 'APPROVED', 'BLOCKED') NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedById` VARCHAR(191) NULL,
    ADD COLUMN `blockedReason` TEXT NULL;

-- CreateTable
CREATE TABLE `smart_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `smart_categories_name_key`(`name`),
    UNIQUE INDEX `smart_categories_slug_key`(`slug`),
    INDEX `smart_categories_slug_idx`(`slug`),
    INDEX `smart_categories_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pg_categories` (
    `id` VARCHAR(191) NOT NULL,
    `pgId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pg_categories_pgId_idx`(`pgId`),
    INDEX `pg_categories_categoryId_idx`(`categoryId`),
    UNIQUE INDEX `pg_categories_pgId_categoryId_key`(`pgId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pgs` ADD CONSTRAINT `pgs_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pg_categories` ADD CONSTRAINT `pg_categories_pgId_fkey` FOREIGN KEY (`pgId`) REFERENCES `pgs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pg_categories` ADD CONSTRAINT `pg_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `smart_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
