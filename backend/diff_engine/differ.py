import diff_match_patch as dmp_module

# Initialize the diff engine
_dmp = dmp_module.diff_match_patch()

# Optional: set timeout in seconds (default = 1.0)
_dmp.Diff_Timeout = 1.0

def build_line_map(text: str) -> dict:
    """
    建立字元位置到行號的映射
    
    參數:
        text: 要分析的文字
        
    返回:
        一個字典，鍵為字元在文本中的位置索引，值為該字元所在的行號（從1開始）
    """
    line_map = {}
    line_num = 1
    for i, char in enumerate(text):
        line_map[i] = line_num
        if char == '\n':
            line_num += 1
    return line_map

def find_affected_lines(line_map: dict, start_pos: int, end_pos: int) -> list[int]:
    """
    找出一段文字區間影響到的所有行號
    
    參數:
        line_map: 由build_line_map建立的字元位置到行號的映射
        start_pos: 區間起始位置
        end_pos: 區間結束位置
        
    返回:
        一個列表，包含所有受影響的行號
    """
    affected_lines = set()
    for pos in range(start_pos, end_pos):
        if pos in line_map:
            affected_lines.add(line_map[pos])
    return sorted(list(affected_lines))


def compute_diff(text1: str, text2: str) -> list[dict]:
    """
    計算兩段文字之間的語義差異，使用Google Diff Match Patch。
    
    文字會先進行Unicode正規化和行尾標準化，再進行比較。
    結果包含每個差異區段所影響的行號信息。
    
    參數:
        text1: 第一段文字
        text2: 第二段文字
        
    返回:
        一個列表，每個元素是一個字典，包含以下鍵:
        - 'operation': 'EQUAL', 'INSERT', 或 'DELETE'之一
        - 'text': 相應的子字符串
        - 'lines': 這個差異區段所影響的行號列表
    """
    # 加入 Unicode 正規化與空格處理
    import unicodedata
    text1 = unicodedata.normalize('NFC', text1).replace('\r\n', '\n')
    text2 = unicodedata.normalize('NFC', text2).replace('\r\n', '\n')
    
    # 建立字元位置到行號的映射
    line_map1 = build_line_map(text1)
    line_map2 = build_line_map(text2)
    
    # 計算差異
    diffs = _dmp.diff_main(text1, text2)
    # 進行語義清理（合併微小的相等部分）
    _dmp.diff_cleanupSemantic(diffs)

    # 操作碼映射到標籤
    op_map = {
        _dmp.DIFF_EQUAL: 'EQUAL',
        _dmp.DIFF_INSERT: 'INSERT',
        _dmp.DIFF_DELETE: 'DELETE'
    }

    # 構建結果列表，加入行號定位
    result = []
    current_pos1 = 0  # 追蹤text1中的當前位置
    current_pos2 = 0  # 追蹤text2中的當前位置
    
    for op_code, segment in diffs:
        op = op_map.get(op_code, 'UNKNOWN')
        
        if op == 'EQUAL':
            # 相等部分，兩個文本都向前移動
            lines_affected1 = find_affected_lines(line_map1, current_pos1, current_pos1 + len(segment))
            lines_affected2 = find_affected_lines(line_map2, current_pos2, current_pos2 + len(segment))
            current_pos1 += len(segment)
            current_pos2 += len(segment)
            
            result.append({
                'operation': op,
                'text': segment,
                'lines': {
                    'text1': lines_affected1,
                    'text2': lines_affected2
                }
            })
        elif op == 'DELETE':
            # 刪除部分，只在text1中移動
            lines_affected = find_affected_lines(line_map1, current_pos1, current_pos1 + len(segment))
            current_pos1 += len(segment)
            
            result.append({
                'operation': op,
                'text': segment,
                'lines': {
                    'text1': lines_affected,
                    'text2': []
                }
            })
        elif op == 'INSERT':
            # 插入部分，只在text2中移動
            lines_affected = find_affected_lines(line_map2, current_pos2, current_pos2 + len(segment))
            current_pos2 += len(segment)
            
            result.append({
                'operation': op,
                'text': segment,
                'lines': {
                    'text1': [],
                    'text2': lines_affected
                }
            })
    
    return result