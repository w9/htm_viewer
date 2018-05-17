Instruction
-----------

To clone this repo into your computer, run the following commands in your **Terminal**:

```
$ cd
$ git clone https://github.com/w9/htm_viewer
```

To install Python dependencies:

```
$ sudo pip install bs4 ansicolors
```

To download the HTM files:

```
$ cd ~/htm_viewer/public
$ python p1-process.py
```

To start the web app:

```
$ cd ~/htm_viewer
$ yarn install
$ yarn start
```

**Updated 05/16/2018**: To search for patterns (this assumes `o1-htm_files` is populated)

```
$ cd ~/htm_viewer/scripts
$ node searchKeywords.js
```

The above command generates a `results.csv` file which contains all occurrences of
the searched pattern among the htm files. You can then copy this file as the new
`list.csv` in `~/htm_viewer/public/`.