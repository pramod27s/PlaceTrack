package org.pramod.backend.company;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pramod.backend.company.CompanyDtos.CompanyRequest;
import org.pramod.backend.company.CompanyDtos.CompanyResponse;
import org.pramod.backend.company.CompanyDtos.StageUpdateRequest;
import org.pramod.backend.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public List<CompanyResponse> list(@AuthenticationPrincipal User user) {
        return companyService.listForUser(user);
    }

    @GetMapping("/{id}")
    public CompanyResponse get(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return companyService.get(user, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyResponse create(@AuthenticationPrincipal User user,
                                  @Valid @RequestBody CompanyRequest request) {
        return companyService.create(user, request);
    }

    @PutMapping("/{id}")
    public CompanyResponse update(@AuthenticationPrincipal User user,
                                  @PathVariable Long id,
                                  @Valid @RequestBody CompanyRequest request) {
        return companyService.update(user, id, request);
    }

    /** Lightweight endpoint used by the Kanban board on drag-and-drop. */
    @PatchMapping("/{id}/stage")
    public CompanyResponse updateStage(@AuthenticationPrincipal User user,
                                       @PathVariable Long id,
                                       @Valid @RequestBody StageUpdateRequest request) {
        return companyService.updateStage(user, id, request.stage());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        companyService.delete(user, id);
    }
}
