# Resolve all git merge conflicts - keep HEAD (our dark mode changes)
$srcDir = 'src'
$files = Get-ChildItem -Path $srcDir -Recurse -Include '*.tsx','*.ts','*.css' | Where-Object { 
    (Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue) -match '<<<<<<<'
}

Write-Host "Found $($files.Count) files with conflicts"

foreach ($file in $files) {
    try {
        $lines = Get-Content $file.FullName -Encoding UTF8
        $result = [System.Collections.Generic.List[string]]::new()
        $inHead = $false
        $inOther = $false
        $changed = $false

        foreach ($line in $lines) {
            if ($line -match '^<<<<<<< ') {
                $inHead = $true
                $inOther = $false
                $changed = $true
                continue
            }
            if ($line -match '^=======$') {
                $inHead = $false
                $inOther = $true
                continue
            }
            if ($line -match '^>>>>>>> ') {
                $inOther = $false
                continue
            }
            if (-not $inOther) {
                $result.Add($line)
            }
        }

        if ($changed) {
            [System.IO.File]::WriteAllLines($file.FullName, $result, [System.Text.UTF8Encoding]::new($false))
            Write-Host "Fixed: $($file.FullName.Replace((Get-Location).Path + '\', ''))"
        }
    } catch {
        Write-Host "ERROR on $($file.Name): $_"
    }
}
Write-Host ""
Write-Host "All conflicts resolved! HEAD (dark mode) version kept."
