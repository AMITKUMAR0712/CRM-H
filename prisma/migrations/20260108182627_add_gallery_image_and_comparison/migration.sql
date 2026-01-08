-- AlterTable
ALTER TABLE `faqs` ADD COLUMN `sectorId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `leads` ADD COLUMN `hasConsent` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `gallery_images` (
    `id` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `altText` VARCHAR(255) NULL,
    `caption` VARCHAR(255) NULL,
    `album` VARCHAR(191) NOT NULL,
    `sectorSlug` VARCHAR(191) NULL,
    `pgId` VARCHAR(191) NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `gallery_images_album_idx`(`album`),
    INDEX `gallery_images_sectorSlug_idx`(`sectorSlug`),
    INDEX `gallery_images_pgId_idx`(`pgId`),
    INDEX `gallery_images_isFeatured_idx`(`isFeatured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comparisons` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NULL,
    `pgIds` JSON NOT NULL,
    `shareCode` VARCHAR(12) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `comparisons_shareCode_key`(`shareCode`),
    INDEX `comparisons_sessionId_idx`(`sessionId`),
    INDEX `comparisons_shareCode_idx`(`shareCode`),
    INDEX `comparisons_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `faqs_sectorId_idx` ON `faqs`(`sectorId`);

-- AddForeignKey
ALTER TABLE `faqs` ADD CONSTRAINT `faqs_sectorId_fkey` FOREIGN KEY (`sectorId`) REFERENCES `sectors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
