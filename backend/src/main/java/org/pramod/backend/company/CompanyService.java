package org.pramod.backend.company;

import lombok.RequiredArgsConstructor;
import org.pramod.backend.company.CompanyDtos.CompanyRequest;
import org.pramod.backend.company.CompanyDtos.CompanyResponse;
import org.pramod.backend.exception.ResourceNotFoundException;
import org.pramod.backend.journal.JournalRepository;
import org.pramod.backend.round.Round;
import org.pramod.backend.round.RoundRepository;
import org.pramod.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final RoundRepository roundRepository;
    private final JournalRepository journalRepository;

    @Transactional(readOnly = true)
    public List<CompanyResponse> listForUser(User user) {
        return companyRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse get(User user, Long id) {
        return toResponse(require(user, id));
    }

    @Transactional
    public CompanyResponse create(User user, CompanyRequest request) {
        Company company = Company.builder()
                .user(user)
                .stage(request.stage() != null ? request.stage() : Stage.APPLIED)
                .appliedOn(request.appliedOn() != null ? request.appliedOn() : LocalDate.now())
                .build();
        apply(company, request);
        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse update(User user, Long id, CompanyRequest request) {
        Company company = require(user, id);
        if (request.stage() != null) {
            company.setStage(request.stage());
        }
        company.setAppliedOn(request.appliedOn());
        apply(company, request);
        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse updateStage(User user, Long id, Stage stage) {
        Company company = require(user, id);
        company.setStage(stage);
        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public void delete(User user, Long id) {
        Company company = require(user, id);
        List<Round> rounds = roundRepository.findByCompanyOrderByScheduledAtAsc(company);
        for (Round round : rounds) {
            journalRepository.deleteByRound(round);
        }
        roundRepository.deleteAll(rounds);
        companyRepository.delete(company);
    }

    /** Loads a company, enforcing that it belongs to the calling user. */
    public Company require(User user, Long id) {
        return companyRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found."));
    }

    private void apply(Company company, CompanyRequest request) {
        company.setName(request.name().trim());
        company.setRole(trimToNull(request.role()));
        company.setCtc(trimToNull(request.ctc()));
        company.setLocation(trimToNull(request.location()));
        company.setJdLink(trimToNull(request.jdLink()));
        company.setResearchNotes(request.researchNotes());
        company.setResumeVersion(trimToNull(request.resumeVersion()));
        company.setRegisteredOnSuperset(Boolean.TRUE.equals(request.registeredOnSuperset()));
    }

    private CompanyResponse toResponse(Company c) {
        return new CompanyResponse(
                c.getId(), c.getName(), c.getRole(), c.getCtc(), c.getLocation(), c.getJdLink(),
                c.getStage(), c.getAppliedOn(), c.isRegisteredOnSuperset(), c.getResearchNotes(),
                c.getResumeVersion(), (int) roundRepository.countByCompany(c),
                c.getCreatedAt(), c.getUpdatedAt());
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
