from markitdown._markitdown import MarkItDown

# 测试文本转换
test_text = """# Test Title
## Subtitle
This is a test paragraph.

- List item 1
- List item 2

```python
print("Hello World")
```
"""

try:
    # 保存测试文本到文件
    with open("test_input.txt", "w", encoding="utf-8") as f:
        f.write(test_text)
    
    # 测试文件转换功能
    print("Testing file conversion...")
    converter = MarkItDown()
    result = converter.convert("test_input.txt")
    
    print("\nResult type:", type(result))
    print("\nResult dir:", dir(result))
    print("\nResult vars:", vars(result))
    print("\nResult str:", str(result))
    print("\nResult repr:", repr(result))
    
    print("\nTest completed successfully!")

except Exception as e:
    print(f"Error: {str(e)}")
