import diff_match_patch as dmp_module

# Initialize the diff engine
_dmp = dmp_module.diff_match_patch()

# Optional: set timeout in seconds (default = 1.0)
_dmp.Diff_Timeout = 1.0

# Ensure semantic cleanup for more human-friendly diffs


def compute_diff(text1: str, text2: str) -> list[dict]:
    """
    Compute a semantic diff between two texts using Google Diff Match Patch.

    Returns:
        A list of dicts with keys:
        - 'operation': one of 'EQUAL', 'INSERT', 'DELETE'
        - 'text': the corresponding substring
    """
    # Compute raw diffs
    diffs = _dmp.diff_main(text1, text2)
    # Clean up semantically (merge trivial equalities)
    _dmp.diff_cleanupSemantic(diffs)

    # Map codes to labels
    op_map = {
        _dmp.DIFF_EQUAL: 'EQUAL',
        _dmp.DIFF_INSERT: 'INSERT',
        _dmp.DIFF_DELETE: 'DELETE'
    }

    # Build result list
    result = []
    for op_code, segment in diffs:
        op = op_map.get(op_code, 'UNKNOWN')
        result.append({
            'operation': op,
            'text': segment
        })
    return result

