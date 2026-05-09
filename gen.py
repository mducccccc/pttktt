
def generate_html_rows():
    steps = [
        (0, '—', '—', '[12]', '{12}'),
        (1, '12', '0&nbsp; 7&nbsp; 10', '[0, 7, <span style=\'color: #facc15\'>10</span>]', '{12, 0, 7, 10}'),
        (2, '10', '<span style=\'color: #6b7280\'>0*</span>&nbsp; 6', '[0, 7, <span style=\'color: #facc15\'>6</span>]', '{12, 0, 7, 10, 6}'),
        (3, '6', '<span style=\'color: #6b7280\'>0*</span>&nbsp; 4', '[0, 7, <span style=\'color: #facc15\'>4</span>]', '{…, 10, 6, 4}'),
        (4, '4', '<span style=\'color: #6b7280\'>0*</span>&nbsp; 3', '[0, 7, <span style=\'color: #facc15\'>3</span>]', '{…, 6, 4, 3}'),
        (5, '3', '<span style=\'color: #6b7280\'>0*</span>', '[0, <span style=\'color: #facc15\'>7</span>]', '{…, 6, 4, 3}'),
        (6, '7', '<span style=\'color: #6b7280\'>0*</span>', '[<span style=\'color: #facc15\'>0</span>]', '{…, 6, 4, 3}'),
        (7, '0', '—', '[]', '{…, 6, 4, 3}')
    ]
    html = ''
    for i, step in enumerate(steps):
        bg = ' style=\'background: #0d1526\'' if i % 2 == 1 else ''
        u_style = ' style=\'padding: 6px 10px; text-align: center; border: 1px solid #2a3555;\'' if step[1] == '—' else ' style=\'padding: 6px 10px; text-align: center; border: 1px solid #2a3555; color: #60a5fa; font-weight: 700;\''
        html += f'''                        <tr{bg}>
                          <td style=\'padding: 6px 10px; text-align: center; border: 1px solid #2a3555;\'>{step[0]}</td>
                          <td{u_style}>{step[1]}</td>
                          <td style=\'padding: 6px 10px; border: 1px solid #2a3555; font-family: monospace;\'>{step[2]}</td>
                          <td style=\'padding: 6px 10px; border: 1px solid #2a3555; font-family: monospace;\'>{step[3]}</td>
                          <td style=\'padding: 6px 10px; border: 1px solid #2a3555; font-family: monospace;\'>{step[4]}</td>
                        </tr>\n'''
    print(html)
generate_html_rows()

