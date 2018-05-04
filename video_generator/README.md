# FFmpeg samples
Add audio to video
```
ffmpeg -i video.avi -i audio.mp3 -codec copy -shortest output.avi
```

Add subtitle to video
```
ffmpeg -i infile.mp4 -i infile.srt -c copy -c:s mov_text outfile.mp4
```

# canvas-video-generator
TODO

## Install
TODO

