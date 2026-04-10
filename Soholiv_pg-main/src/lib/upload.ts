import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'

const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES ?? String(5 * 1024 * 1024))
const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
])

function hasCloudinaryConfig(): boolean {
    return Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    )
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface UploadResult {
    success: boolean
    url?: string
    publicId?: string
    width?: number
    height?: number
    format?: string
    error?: string
}

interface UploadOptions {
    folder?: string
    transformation?: {
        width?: number
        height?: number
        crop?: string
        quality?: string | number
    }
    resourceType?: 'image' | 'video' | 'raw' | 'auto'
}

/**
 * Upload a file to Cloudinary from a File object
 */
export async function uploadFile(
    file: File,
    options: UploadOptions = {}
): Promise<UploadResult> {
    try {
        if (!hasCloudinaryConfig()) {
            return { success: false, error: 'Upload is not configured' }
        }

        if (file.size > MAX_UPLOAD_BYTES) {
            return { success: false, error: 'File size exceeds limit' }
        }

        if (file.type && !ALLOWED_IMAGE_TYPES.has(file.type)) {
            return { success: false, error: 'Unsupported file type' }
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: options.folder || 'soho-pg',
                    resource_type: options.resourceType || 'auto',
                    transformation: options.transformation ? [options.transformation] : undefined,
                },
                (error, result) => {
                    if (error) reject(error)
                    else if (result) resolve(result)
                    else reject(new Error('No result from upload'))
                }
            ).end(buffer)
        })

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
        }
    } catch (error) {
        console.error('Upload failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        }
    }
}

/**
 * Upload a file from a base64 string
 */
export async function uploadBase64(
    base64String: string,
    options: UploadOptions = {}
): Promise<UploadResult> {
    try {
        const result = await cloudinary.uploader.upload(base64String, {
            folder: options.folder || 'soho-pg',
            resource_type: options.resourceType || 'auto',
            transformation: options.transformation ? [options.transformation] : undefined,
        })

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
        }
    } catch (error) {
        console.error('Upload failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        }
    }
}

/**
 * Upload file from URL
 */
export async function uploadFromUrl(
    url: string,
    options: UploadOptions = {}
): Promise<UploadResult> {
    try {
        const result = await cloudinary.uploader.upload(url, {
            folder: options.folder || 'soho-pg',
            resource_type: options.resourceType || 'auto',
            transformation: options.transformation ? [options.transformation] : undefined,
        })

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
        }
    } catch (error) {
        console.error('Upload failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        }
    }
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFile(publicId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await cloudinary.uploader.destroy(publicId)
        return { success: true }
    } catch (error) {
        console.error('Delete failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Delete failed',
        }
    }
}

/**
 * Generate optimized image URL with transformations
 */
export function getOptimizedUrl(
    publicId: string,
    options: {
        width?: number
        height?: number
        crop?: string
        quality?: string | number
        format?: string
    } = {}
): string {
    return cloudinary.url(publicId, {
        secure: true,
        transformation: [
            {
                width: options.width,
                height: options.height,
                crop: options.crop || 'fill',
                quality: options.quality || 'auto',
                fetch_format: options.format || 'auto',
            },
        ],
    })
}

/**
 * Upload PG photo with optimizations
 */
export async function uploadPGPhoto(file: File, pgSlug: string): Promise<UploadResult> {
    return uploadFile(file, {
        folder: `soho-pg/pgs/${pgSlug}`,
        resourceType: 'image',
        transformation: {
            width: 1200,
            height: 800,
            crop: 'fill',
            quality: 'auto:good',
        },
    })
}

/**
 * Upload gallery image
 */
export async function uploadGalleryImage(file: File, album: string): Promise<UploadResult> {
    return uploadFile(file, {
        folder: `soho-pg/gallery/${album}`,
        resourceType: 'image',
        transformation: {
            width: 1600,
            height: 1200,
            crop: 'fill',
            quality: 'auto:good',
        },
    })
}

/**
 * Upload banner image
 */
export async function uploadBannerImage(file: File): Promise<UploadResult> {
    return uploadFile(file, {
        folder: 'soho-pg/banners',
        resourceType: 'image',
        transformation: {
            width: 1600,
            height: 900,
            crop: 'fill',
            quality: 'auto:good',
        },
    })
}
