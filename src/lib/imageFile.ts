const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const ACCEPTED_IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i

export function isAcceptedImageFile(file: File): boolean {
  if (ACCEPTED_IMAGE_TYPES.has(file.type)) return true
  return ACCEPTED_IMAGE_EXTENSIONS.test(file.name)
}
