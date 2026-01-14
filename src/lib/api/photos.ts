import { api } from './client'

export interface OrderPhoto {
    id: string
    order_id: string
    uploaded_by?: string
    file_path: string
    file_url?: string
    description?: string
    file_size?: number
    mime_type?: string
    created_at: string
}

export const photosApi = {
    /**
     * Upload a photo for an order
     */
    uploadPhoto: async (
        orderId: string,
        file: File,
        description?: string
    ): Promise<OrderPhoto> => {
        const formData = new FormData()
        formData.append('file', file)
        if (description) {
            formData.append('description', description)
        }

        return api.upload<OrderPhoto>(`/photos/orders/${orderId}/photos`, formData)
    },

    /**
     * Get all photos for an order
     */
    getPhotos: async (orderId: string): Promise<OrderPhoto[]> => {
        return api.get<OrderPhoto[]>(`/photos/orders/${orderId}/photos`)
    },

    /**
     * Get a specific photo
     */
    getPhoto: async (photoId: string): Promise<OrderPhoto> => {
        return api.get<OrderPhoto>(`/photos/${photoId}`)
    },

    /**
     * Delete a photo
     */
    deletePhoto: async (photoId: string): Promise<void> => {
        return api.delete<void>(`/photos/${photoId}`)
    },
}
