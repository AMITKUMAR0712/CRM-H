-- AlterTable
ALTER TABLE `chat_threads` ADD COLUMN `assignedToId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `chat_threads_assignedToId_idx` ON `chat_threads`(`assignedToId`);

-- AddForeignKey
ALTER TABLE `chat_threads` ADD CONSTRAINT `chat_threads_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
