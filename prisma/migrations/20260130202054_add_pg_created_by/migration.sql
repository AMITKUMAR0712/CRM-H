-- AlterTable
ALTER TABLE `pgs` ADD COLUMN `createdById` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `pgs_createdById_idx` ON `pgs`(`createdById`);

-- AddForeignKey
ALTER TABLE `pgs` ADD CONSTRAINT `pgs_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
