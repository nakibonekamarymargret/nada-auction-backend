package com.kush.nada.services;

<<<<<<< HEAD
=======
import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
>>>>>>> Development
import com.kush.nada.enums.Role;
import com.kush.nada.exceptions.BadRequestException;
import com.kush.nada.models.UserEntity;
import com.kush.nada.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

<<<<<<< HEAD

=======
>>>>>>> Development
@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

<<<<<<< HEAD
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);


    public UserEntity registerUser(UserEntity user){
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new BadRequestException("Name cannot be empty");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email cannot be empty");
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }
        if (user.getAddress() == null || user.getAddress().isEmpty()) {
            throw new BadRequestException("Address is required.");
        }
        if (user.getPhoneNumber() == null || user.getPhoneNumber().isEmpty()) {
            throw new BadRequestException("Phone Number is required.");
        }
        if(userRepository.existsByPhoneNumber(user.getPhoneNumber())){
            throw new BadRequestException("Phone Number is already taken");
        }
=======
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);

    public UserEntity registerUser(UserEntity user) {
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new BadRequestException("Name cannot be empty");
        }

        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email cannot be empty");
        }

>>>>>>> Development
        if (!user.getEmail().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new BadRequestException("Invalid email format");
        }

<<<<<<< HEAD
        if (!user.getPhoneNumber().matches("^\\+?[0-9]{10,15}$")) {
            throw new BadRequestException("Invalid phone number format");
        }


        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        user.setRole(userRepository.count() == 0 ? Role.ADMIN : Role.USER);


        return userRepository.save(user);
    }


=======
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        if (user.getAddress() == null || user.getAddress().isEmpty()) {
            throw new BadRequestException("Address is required.");
        }

        if (user.getPhoneNumber() == null || user.getPhoneNumber().isEmpty()) {
            throw new BadRequestException("Phone Number is required.");
        }

        // Normalize first
        String normalizedPhone = normalizePhoneNumber(user.getPhoneNumber());

        // Check for duplicates after normalization
        if (userRepository.existsByPhoneNumber(normalizedPhone)) {
            throw new BadRequestException("Phone Number is already taken");
        }

        user.setPhoneNumber(normalizedPhone);
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        user.setRole(userRepository.count() == 0 ? Role.ADMIN : Role.USER);

        return userRepository.save(user);
    }

    private String normalizePhoneNumber(String input) {
        PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();
        try {
            Phonenumber.PhoneNumber number;

            // 1. Attempt to parse with the full input (may already have country code)
            try {
                number = phoneUtil.parse(input, null); // Try parsing without a region first
                if (phoneUtil.isValidNumber(number)) {
                    return phoneUtil.format(number, PhoneNumberUtil.PhoneNumberFormat.E164);
                }
            } catch (NumberParseException ignored) {
                //  ignore this exception and try the next parsing method
            }

            // 2. Attempt to parse assuming the number is from Uganda (country code 256)
            number = phoneUtil.parse(input, "UG"); //  Set the region code

            if (!phoneUtil.isValidNumber(number)) {
                throw new BadRequestException("Invalid phone number format");
            }
            return phoneUtil.format(number, PhoneNumberUtil.PhoneNumberFormat.E164);

        } catch (NumberParseException e) {
            throw new BadRequestException("Invalid phone number format: " + e.getMessage());
        }
    }
>>>>>>> Development

}
