# Readme

A command line tool that concatenates
[asciinema](http://asciinema.org) asciicasts.

## Installation

Package is not in the npm repository yet, so to install,
download this repository, cd into it and run 
````
npm install . -g 
````
to install the script globally.

## Usage

Run `asciinema_concat --help` to see this message:
````
 Usage: asciinema_concat [options] file1 file2 [file3 ...]

  Concatenate two asciinema casts.
  Metadata for result will be taken from first file.

  Options:

    -h, --help           output usage information
    -o, --output <path>  write to path instead of stdout
    -k, --keepLast       Dont remove last line of each cast.

````

If you exit your casts using `Ctrl-D`, this should work well with
the default options. Check out this asciicast for a demo:

[![asciicast](https://asciinema.org/a/bb8zgacmxjua5vwd1noon0bwa.png)](https://asciinema.org/a/bb8zgacmxjua5vwd1noon0bwa)

