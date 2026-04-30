function ResolveConflicts([string]$FilePath) {
    $lines = [System.IO.File]::ReadAllLines($FilePath, [System.Text.Encoding]::UTF8)
    $result = [System.Collections.Generic.List[string]]::new()
    $inHead = $false
    $inOther = $false
    $changed = $false
    foreach ($line in $lines) {
        if ($line -match '^<<<<<<<') { $inHead = $true; $inOther = $false; $changed = $true; continue }
        if ($line -eq '=======') { $inHead = $false; $inOther = $true; continue }
        if ($line -match '^>>>>>>>') { $inOther = $false; continue }
        if (-not $inOther) { $result.Add($line) }
    }
    if ($changed) {
        [System.IO.File]::WriteAllLines($FilePath, $result, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed: $FilePath"
    }
}
ResolveConflicts 'src\app\(public)\pg-locations\[slug]\page.tsx'
ResolveConflicts 'src\app\(public)\pg\[slug]\page.tsx'
Write-Host "Done!"
