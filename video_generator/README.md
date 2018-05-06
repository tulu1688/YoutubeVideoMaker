# FFmpeg samples
Add audio to video
```
ffmpeg -i video.avi -i audio.mp3 -codec copy -shortest output.avi
```

Add subtitle to video
```
ffmpeg -i infile.mp4 -i infile.srt -c copy -c:s mov_text outfile.mp4
```

Merge multiple audio files
```
ffmpeg -f concat -safe 0 -i mylist.txt -c copy test.mp3

mylist.txt content
#-----
file '1.mp3'
file '2.mp3'
#-----
```

# canvas-video-generator
TODO

## Install
TODO

