import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import ora from 'ora'

const BYTE = 1
const KILOBYTE = 1024 * BYTE
const MEGABYTE = 1024 * KILOBYTE
const GIGABYTE = 1024 * MEGABYTE

const quality = parseInt(process.argv[2], 10) || 80
const avifQuality = Math.floor(quality * 0.7) // 70% of the WebP quality - avif supports further compression without quality loss compared to WebP

// Map the quality (1-100) to a PNG compression level (0-9)
const compressionLevel = Math.min(Math.floor(quality / 10), 9)

const compressedFolderPath = path.join(process.env.INIT_CWD, 'compressed')
if (!fs.existsSync(compressedFolderPath)) {
  fs.mkdirSync(compressedFolderPath)
}
const getFileSize = filePath => fs.statSync(filePath).size

const formatBytes = bytes => {
  if (bytes < KILOBYTE) return `${bytes} Bytes`
  if (bytes < MEGABYTE) return `${(bytes / KILOBYTE).toFixed(2)} KB`
  if (bytes < GIGABYTE) return `${(bytes / MEGABYTE).toFixed(2)} MB`
  return `${(bytes / GIGABYTE).toFixed(2)} GB`
}

const convertGifToWebM = (inputFilePath, outputFilePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .toFormat('webm')
      .on('end', resolve)
      .on('error', reject)
      .save(outputFilePath)
  })
}

const convertGifToMp4 = (inputFilePath, outputFilePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputFilePath, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }
      // Videos won't show on iOS if the width or height are odd numbers using yuv420p
      const { width, height } = metadata.streams[0]
      const newWidth = width % 2 === 0 ? width : width + 1
      const newHeight = height % 2 === 0 ? height : height + 1

      const filters = []
      if (newWidth !== width || newHeight !== height) {
        filters.push(`pad=${newWidth}:${newHeight}`)
      }

      filters.push('format=yuv420p')
      const filterString = filters.join(',')

      ffmpeg(inputFilePath)
        .toFormat('mp4')
        .addOptions([
          '-profile:v baseline',
          '-level 3.0',
          `-vf ${filterString}`,
          '-crf 23',
          '-preset slow',
          '-an'
        ])
        .on('end', resolve)
        .on('error', reject)
        .save(outputFilePath)
    })
  })
}

const handleFiles = async () => {
  const spinner = ora().start()
  const inputImagesPath = path.join(process.env.INIT_CWD, 'images')
  const files = fs.readdirSync(inputImagesPath)

  let totalOriginalSize = 0
  let totalCompressedSize = 0 // Track only AVIF for images and WebM for GIFs

  for (const file of files) {
    const inputFilePath = path.join(inputImagesPath, file)
    const outputFileName = path.parse(file).name
    const { ext } = path.parse(inputFilePath)

    totalOriginalSize += getFileSize(inputFilePath)
    spinner.text = `Processing ${file}...`

    if (ext.toLowerCase() === '.gif') {
      const webmOutputFilePath = path.join(
        compressedFolderPath,
        outputFileName + '.webm'
      )

      try {
        await convertGifToWebM(inputFilePath, webmOutputFilePath)
        totalCompressedSize += getFileSize(webmOutputFilePath) // Only WebM size is added here for GIFs

        // The rest of the conversion and copying are kept, but their sizes aren't tracked for the savings calculation
        const mp4OutputFilePath = path.join(
          compressedFolderPath,
          outputFileName + '.mp4'
        )
        await convertGifToMp4(inputFilePath, mp4OutputFilePath)

        const gifOutputFilePath = path.join(
          compressedFolderPath,
          outputFileName + '.gif'
        )
        fs.copyFileSync(inputFilePath, gifOutputFilePath)
      } catch (error) {
        console.error(`Error processing ${file}:`, error)
      }
    } else {
      const avifOutputFilePath = path.join(
        compressedFolderPath,
        outputFileName + '.avif'
      )

      try {
        const image = sharp(inputFilePath)
        await image.avif({ quality: avifQuality }).toFile(avifOutputFilePath)
        totalCompressedSize += getFileSize(avifOutputFilePath) // Only AVIF size is added here for images

        // The rest of the conversion and copying are kept, but their sizes aren't tracked for the savings calculation
        const webpOutputFilePath = path.join(
          compressedFolderPath,
          outputFileName + '.webp'
        )
        await image.webp({ quality }).toFile(webpOutputFilePath)

        const originalOutputFilePath = path.join(
          compressedFolderPath,
          file // keeping original filename including extension
        )
        if (ext === '.jpg' || ext === '.jpeg') {
          await image.jpeg({ quality }).toFile(originalOutputFilePath)
        }
        if (ext === '.png') {
          await image.png({ compressionLevel }).toFile(originalOutputFilePath)
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error)
      }
    }
  }

  spinner.succeed('All files processed.')

  const savedSpace = totalOriginalSize - totalCompressedSize
  const percentageSaved = Math.round((savedSpace / totalOriginalSize) * 100)

  console.log(
    `Total space saved: ${formatBytes(savedSpace)} (${percentageSaved}%)`
  )
}

handleFiles()
