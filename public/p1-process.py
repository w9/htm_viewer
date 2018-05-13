import csv
import requests
import os
import errno
from time import sleep
from bs4 import Tag, BeautifulSoup, NavigableString
from colors import color
import re
from sys import exit

import signal

class TimeoutError(Exception):
    pass

class Timeout:
    def __init__(self, seconds=1, error_message='Timeout'):
        self.seconds = seconds
        self.error_message = error_message
    def handle_timeout(self, signum, frame):
        raise TimeoutError(self.error_message)
    def __enter__(self):
        signal.signal(signal.SIGALRM, self.handle_timeout)
        signal.alarm(self.seconds)
    def __exit__(self, type, value, traceback):
        signal.alarm(0)

keywords = [
    'gender equality',
    'female',
    'male',
    'board diversity',
    'diverse',
]


def is_toc_link(el):
    return isinstance(el, Tag) and el.name == 'a' and el.has_attr(
        'href') and 'table of content' in el.get_text().lower()


def if_page_break_el(el):
    return el.has_attr('style') and (
        'page-break-before' in el['style'].lower()
        or 'page-break-after' in el['style'].lower())


def is_toc(toc_name):
    return lambda el: el.has_attr('name') and el['name'] == toc_name


def to_text(el):
    return el.get_text() if isinstance(el, Tag) else str(el)


def process_row(i, row):
    global num_links

    # if int(row['num_pages_with_proposal']) <= 4:
    #     return

    try:
        with Timeout(seconds=120):
            link_to_doc = 'https://www.sec.gov/Archives/' + row['Filename']
            index = row['CIK']
            filename = './o1-htm_files/' + row['Filename'] + '.htm'

            res_text = requests.get(link_to_doc).text

            print('{:7} : ({}/{}) {} ({} bytes)'.format(index, i, num_links, filename, len(res_text)))

            if not os.path.exists(os.path.dirname(filename)):
                try:
                    os.makedirs(os.path.dirname(filename))
                except OSError as exc:
                    if exc.errno != errno.EEXIST:
                        raise

            with open(filename, 'w') as ofile:
                ofile.write(res_text)

    except:
        print('HEY!!!!!!!!!')
        return None


def main():
    global num_links
    with open('./list.csv') as input_file:
        input_table = list(csv.DictReader(input_file))
        #input_table = [x for x in input_table if int(x['num_pages_with_shareholder_proposal']) > 5]

    num_links = len(input_table)

    for i, row in enumerate(input_table):
        process_row(i, row)
        sleep(0.15)

    # Parallel(n_jobs=50)([delayed(process_row)(i, row) for i, row in enumerate(input_table)])

if __name__ == '__main__':
    main()
