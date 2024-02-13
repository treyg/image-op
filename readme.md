# Image Compression and WebP/Avif + GIF Conversion

This is a simple script that compresses images and converts them to WebP and Avif format. The output folder will include both the original images and their WebP and Avif versions - both compressed. Your original image folder will remain untouched. GIFs will be converted to WebM and mp4.

## Usage

Prior to using for the first time - open the path to the ticket repo in the terminal and run:

```
npm install
```

<br>

> ⚠️ Note
>
> In order to convert gif to webm, you'll need ffmpeg installed on your machine. If you don't have it, you can install it with Homebrew: `brew install ffmpeg` (MacOS only). See the [ffmpeg not found](#ffmpeg-not-found-error) section below for more details and instructions for Windows.

<br>

1. In the folder for your current ticket, create an `images` folder and place your original images in it

2. From the same folder, run the following command: `npm run images`

3. The app will run and create a folder named `compressed` at the same level as your images folder.
   - Inside the `compressed` folder, you will find the compressed images and their corresponding conversions.

That's it! Your images are now compressed and available in both their original format and as WebP and Avif versions.

---

#### Optional

Adjust the image quality:

Some brands are pickier than other others about their images being blurry. If you need to adjust the image quality, you can do so by following these steps:

- By default, the image quality is set to 80. To change it, provide a command-line argument when running the script.
- Specify the desired image quality as an integer between 10 and 99.
- For example, to set the image quality to 70, run the following command:

_Note: GIFs are not affected by the image quality setting_

```
npm run images:quality 70
```

---

### `ffmpeg not found` error?

#### MacOS

If you encounter an error stating "ffmpeg not found", it's likely that either:

- You haven't installed ffmpeg.
- ffmpeg is installed but not accessible in your PATH.

If you installed ffmpeg with Homebrew, ensure it's in your PATH by adding the following command to your shell startup file (e.g., ~/.zshrc or ~/.bash_profile):

```
export PATH="/opt/homebrew/bin:$PATH"
```

After adding the above line, restart your terminal or source your startup file:
`source ~/.zshrc`

If you're using the built in terminal in vscode and it still doesn't work, you may need to explicity set the PATH in your vscode settings. To do that, open your vscode settings and add the following line to your settings.json file:

```
"terminal.integrated.env.osx": {
    "PATH": "/opt/homebrew/bin:$PATH"
}
```

You can verify that it worked by running `which ffmpeg` in your terminal. If it worked, you should see the following output:

```
/opt/homebrew/bin/ffmpeg
```

#### Windows

On Windows, the process of adding an executable like `ffmpeg` to your `PATH` so that it's recognized in any command prompt or terminal window is different from macOS. Here's a step-by-step process to achieve the equivalent result on Windows:

##### 1. Installing ffmpeg:

- Download `ffmpeg` for Windows from its official [download page](https://ffmpeg.org/download.html).
- Extract the downloaded ZIP file to a location on your computer. For example, `C:\ffmpeg`.

##### 2. Adding ffmpeg to your Windows PATH:

1. Right-click on the Start button and select `System`.
2. Click on `Advanced system settings` on the right panel.
3. In the `System Properties` window, click on the `Environment Variables` button.
4. In the `Environment Variables` window, highlight the `Path` variable in the "System variables" section and click on the `Edit` button.
5. In the `Edit Environment Variable` window, click on the `New` button and then paste in the path to the `bin` directory inside where you extracted `ffmpeg`. If you extracted `ffmpeg` to `C:\ffmpeg`, the path to add would be `C:\ffmpeg\bin`.
6. Click `OK` to close each window.

##### 3. Verifying the Installation:

Open a new Command Prompt or PowerShell window and type:

```bash
ffmpeg -version
```

This should display the version of `ffmpeg` you installed, indicating that the program is accessible from the command line.

##### Note for VSCode users:

If you're using the integrated terminal in Visual Studio Code and it doesn't recognize `ffmpeg` even after adding it to the system `PATH`, ensure that you restart Visual Studio Code. If there's still an issue, you can try adding the path explicitly to VSCode's settings:

1. Open VSCode settings (`File` > `Preferences` > `Settings` or `Ctrl` + `,`).
2. Search for "terminal.integrated.env" in the search bar.
3. Add the following setting (modify the path if you installed `ffmpeg` in a different location):

```json
"terminal.integrated.env.windows": {
    "PATH": "C:\\ffmpeg\\bin;$PATH"
}
```

4. Save and restart VSCode.

This process ensures that `ffmpeg` is globally accessible from any command prompt or terminal on your Windows machine, as well as from within the integrated terminal in Visual Studio Code.
